import Header from "./_components/header";
import OutputPanel from "./_components/output-panel";
import EditorPanel from "./_components/editor-panel";
import { Id } from "../../../../convex/_generated/dataModel";

export default function Home({ params: { id } }: { params: { id: Id<"problems"> } }) {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto p-4">
        <Header />
      </div>

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-[1fr]">
        <div className="h-full">
          <EditorPanel problemId={id} />
        </div>

        <div className="h-full">
          <OutputPanel />
        </div>
      </div>
    </div>
  );
}
