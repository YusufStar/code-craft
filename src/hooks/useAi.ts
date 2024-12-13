import OpenAI from "openai";
import { create } from "zustand";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true,
});

// Zustand store
interface AiState {
  response: string;
  messages: Array<{ role: string; content: string }>;
  isLoading: boolean;
  setResponse: (response: string) => void;
  setMessages: (newMessage: { role: string; content: string }) => void;
  setLoading: (loading: boolean) => void;
}

export const useAiStore = create<AiState>((set) => ({
  response: "",
  messages: [
    {
      role: "user",
      content: `\`\`\`javascript
const sum = (a, b) => a + b;
console.log(sum(2, 3));
\`\`\`
This is a simple sum function in JavaScript.`,
    },
    {
      role: "user",
      content: `\`\`\`python
def greet(name):
    print(f"Hello, {name}!")
greet("Alice")
\`\`\`
This Python code prints a greeting.`,
    },
    {
      role: "user",
      content: `\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
\`\`\`
Java program to print 'Hello, world!'`,
    },
    {
      role: "user",
      content: `\`\`\`typescript
const multiply = (x: number, y: number): number => {
  return x * y;
};
console.log(multiply(5, 4));
\`\`\`
This TypeScript function multiplies two numbers.`,
    },
    {
      role: "user",
      content: `\`\`\`ruby
def square(number)
  number * number
end
puts square(4)
\`\`\`
Ruby code to square a number.`,
    },
  ],
  isLoading: false,
  setResponse: (response) => set({ response }),
  setMessages: (newMessage) =>
    set((state) => ({ messages: [...state.messages, newMessage] })),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// useAi Hook
const useAi = () => {
  const {
    response,
    setResponse,
    messages,
    setMessages,
    isLoading,
    setLoading,
  } = useAiStore();

  const fetchAiResponse = async (
    messages: Array<{ role: string; content: string }>
  ) => {
    try {
      setLoading(true);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        //@ts-expect-error: Error name
        messages,
      });

      const result = completion.choices[0].message.content;
      if (!result) return;
      setResponse(result);
    } catch (error) {
      console.error("Error with AI response:", error);
      setResponse("");
    } finally {
      setLoading(false);
    }
  };

  const codeAnalyze = async (code: string, language: string) => {
    const newMessage = {
      role: "user",
      content: `\`\`\`${language}
${code}
\`\`\``,
    };

    setMessages(newMessage);
    await fetchAiResponse([newMessage]);
  };

  const codeChat = async (
    code: string,
    language: string,
    userMessage: string
  ) => {
    const newMessage = {
      role: "user",
      content: `\`\`\`${language}
${code}
\`\`\`
${userMessage}`,
    };

    setMessages(newMessage);
    await fetchAiResponse([newMessage]);
  };

  const errorFinder = async (code: string, language: string) => {
    const newMessage = {
      role: "user",
      content: `\`\`\`${language}
${code}
\`\`\``,
    };

    setMessages(newMessage);
    await fetchAiResponse([newMessage]);
  };

  return {
    response,
    messages,
    isLoading,
    codeAnalyze,
    codeChat,
    errorFinder,
    setMessages,
  };
};

export default useAi;
