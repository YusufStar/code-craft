import React from "react";

import Markdown from "react-markdown";
import remarkMdx from "remark-mdx";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkBreaks from "remark-breaks";
import CodeBlock from "./CodeBlock";
import { motion, AnimatePresence } from "framer-motion";

const QuestionTab = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="question"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-col max-h-[600px]"
      >
        <div
          className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
        rounded-xl p-4 h-[600px]  overflow-auto font-mono text-sm"
        >
          <Markdown
            className={"markdown"}
            remarkPlugins={[
              remarkMdx,
              remarkMath,
              remarkGfm,
              remarkDirective,
              remarkFrontmatter,
              remarkBreaks,
            ]}
            components={{
              //@ts-expect-error: Error
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");

                return !inline && match ? (
                  <CodeBlock
                    code={String(children).trim()}
                    language={match[0]?.replace("language-", "")}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {`
# Kodlama Mülakatı Sorusu: **Test Amaçlı**

> Bu belge, bir adayın problem çözme ve kodlama becerilerini değerlendirmek amacıyla hazırlanmıştır. Aşağıdaki soru test amaçlıdır ve herhangi bir gerçek dünya senaryosunu temsil etmeyebilir. Lütfen verilen yönergeleri dikkatlice okuyun ve çözümü belirli bir süre içinde tamamlamaya çalışın.

---

## Soru: **En Uzun Artan Alt Dizi**

Bir tamsayı dizisi verildiğinde, bu dizideki **art arda gelmek zorunda olmayan** elemanlardan oluşan **en uzun artan alt dizinin** uzunluğunu bulun.

### Örnekler:

#### Örnek 1:
**Girdi:**  
\`\`\`javascript
const nums = [10, 9, 2, 5, 3, 7, 101, 18];
\`\`\`

**Çıktı:**  
\`\`\`javascript
4
\`\`\`

**Açıklama:**  
En uzun artan alt dizi şunlardan biri olabilir: \`[2, 3, 7, 101]\`.

#### Örnek 2:
**Girdi:**  
\`\`\`javascript
const nums = [0, 1, 0, 3, 2, 3];
\`\`\`

**Çıktı:**  
\`\`\`javascript
4
\`\`\`

**Açıklama:**  
En uzun artan alt dizi şunlardan biri olabilir: \`[0, 1, 2, 3]\`.

#### Örnek 3:
**Girdi:**  
\`\`\`javascript
const nums = [7, 7, 7, 7, 7];
\`\`\`

**Çıktı:**  
\`\`\`javascript
1
\`\`\`

**Açıklama:**  
Dizi tamamen aynı elemanlardan oluştuğu için en uzun artan alt dizi herhangi bir elemandır: \`[7]\`.

---

## Kısıtlamalar:

- \`1 <= nums.length <= 2500\`
- \`-10^4 <= nums[i] <= 10^4\`

---

## İpuçları:

1. Dinamik programlama (DP) kullanarak bir çözüm geliştirebilirsiniz. 
   - \`dp[i]\` dizisi, \`nums[i]\` elemanı ile biten en uzun artan alt dizinin uzunluğunu tutabilir.
   - Her bir eleman için öncesindeki tüm elemanları kontrol edip \`dp[i]\` değerini güncelleyebilirsiniz.

2. **Daha verimli bir çözüm:**  
   İkili arama ile çalışan bir yöntem (örneğin, *Binary Indexed Tree* veya *Fenwick Tree*) kullanarak \`O(n log n)\` karmaşıklığında bir çözüm geliştirebilirsiniz.

---

## Görev:

1. Yukarıdaki örnekleri dikkate alarak, bu problemi çözen bir fonksiyon yazın:
   \`\`\`javascript
   function lengthOfLIS(nums) {
       // Kodunuzu buraya yazın
   }
   \`\`\`

2. Fonksiyonunuz, verilen girdi üzerinde doğru çıktıyı üretmelidir.

3. Kodunuzu test etmek için farklı test vakalarını kullanmayı unutmayın.
  `}
          </Markdown>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestionTab;
