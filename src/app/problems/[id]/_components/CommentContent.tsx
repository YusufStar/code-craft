import CodeBlock from "./CodeBlock";

const reformatCodeWithMessage = (input: string): string => {
  const codeStart = input.indexOf("```");
  const codeEnd = input.lastIndexOf("```");

  if (codeStart === -1 || codeEnd === -1 || codeStart === codeEnd) return input;

  const codeBlock = input.slice(codeStart, codeEnd + 3); // includes both ```
  const message = input.slice(codeEnd + 3).trim(); // message after code block

  return codeBlock + "\n" + message;
};

function CommentContent({ content, role }: { content: string; role: string }) {
  const result = reformatCodeWithMessage(content);

  const parts = result.split(/(```[\w-]*\n[\s\S]*?\n```)/g);

  return (
    <div className={`max-w-[500%] pb-4 ${role === "user" ? "ml-auto" : "mr-auto"}`}>
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          //           ```javascript
          // const name = "John";
          // ```
          const match = part.match(/```([\w-]*)\n([\s\S]*?)\n```/);

          if (match) {
            const [, language, code] = match;
            return <CodeBlock language={language} code={code} key={index} />;
          }
        }

        return part.split("\n").map((line, lineIdx) => (
          <p key={lineIdx} className={`${role === "user" ? "text-right text-gray-100" : "text-left text-gray-300"} last:mb-0`}>
            {line}
          </p>
        ));
      })}
    </div>
  );
}
export default CommentContent;
