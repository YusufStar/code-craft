import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Stripe from "stripe";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const pay = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.runQuery(api.users.getUser, {
      userId: identity?.subject,
    });

    if (!user || !identity) {
      throw new Error("User not found");
    }

    const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
      apiVersion: "2024-12-18.acacia",
    });

    const domain = process.env.NEXT_PUBLIC_HOSTING_URL!;

    const session: Stripe.Response<Stripe.Checkout.Session> =
      await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price: process.env.NEXT_ONE_TIME_PAYMENT_PRICE_ID!,
            quantity: 1,
          },
        ],
        customer_email: user.email,
        metadata: {
          userId: user._id,
        },
        success_url: `${domain}/pricing`,
        cancel_url: `${domain}/pricing`,
      });

    return session.url;
  },
});

type MetaData = {
  userId: Id<"users">;
};

export const fulfill = internalAction({
  args: {
    signature: v.string(),
    payload: v.string(),
  },

  handler: async ({ runMutation }, { signature, payload }) => {
    const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
      apiVersion: "2024-12-18.acacia",
    });
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {
      const event = await stripe.webhooks.constructEventAsync(
        payload,
        signature,
        webhookSecret
      );
      const completedEvent = event.data.object as Stripe.Checkout.Session & {
        metadata: MetaData;
      };

      console.log("Event type", event.type);

      if (event.type === "checkout.session.completed") {
        const userId = completedEvent.metadata.userId;

        await runMutation(api.users.upgradeToPro, {
          _id: userId,
          sessionId: completedEvent.id,
        });

        console.log("User upgraded to Pro", userId);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: (err as { message: string }).message };
    }
  },
});
