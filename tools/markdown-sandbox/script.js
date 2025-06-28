const editor = document.getElementById('markdown-editor');
const preview = document.getElementById('markdown-preview');
const injectSampleButton = document.getElementById('inject-sample-button');
const clearButton = document.getElementById('clear-button');
const copyButton = document.getElementById('copy-button');
const saveButton = document.getElementById('save-button');

const dragbar = document.getElementById('dragbar');
const editorPane = document.getElementById('editor-pane');
const previewPane = document.getElementById('preview-pane');

let isDragging = false;


// Your pre-built Markdown demo content (this remains unchanged)
const sampleMarkdownCode = `# Welcome to the Interactive Markdown Playground! 👋

Type your Markdown on the left, and see the **magic** happen on the right. This app helps you learn and visualize Markdown syntax instantly.

---

## 🚀 Basic Text Formatting

* **Bold Text:** \`**This text is bold.**\` or \`__This is also bold.___\`
* *Italic Text:* \`*This text is italic.*\` or \`_This is also italic._\`
* ***Bold and Italic:*** \`***This is both.***\`
* ~~Strikethrough:~~ \`~~This text is struck through.~~\`

## 🔗 Links and Images

Markdown makes adding links and images incredibly easy!

* **Visit Google:** \`[Google](https://www.google.com)\`
* **Gemini AI:** \`[Learn about Gemini](https://www.google.com/search?q=Gemini+AI)\`

### Image Example:
Here's a placeholder image:
\`![Placeholder Image](https://via.placeholder.com/150/0000FF/FFFFFF?text=Awesome%20Image)\`
*(Note: Images might not render if the source URL is blocked or unavailable.)*

## 📝 Lists (Ordered & Unordered)

### Unordered List:
* Item One
* Item Two
    * Sub-item A
    * Sub-item B
* Item Three

### Ordered List:
1.  First item
2.  Second item
    1.  Nested ordered item
    2.  Another nested item
3.  Third item

## 💻 Code Blocks & Inline Code

Markdown is perfect for sharing code snippets.

### Inline Code:
Use \`npm install\` to get started. The \`console.log()\` function is handy.

### Code Block (with Syntax Highlighting Hint):
\`\`\`javascript
// This is a JavaScript code block
function helloWorld() {
    console.log("Hello, Markdown Learners!");
    const now = new Date();
    return \`Current time: \${now.toLocaleTimeString()}\`;
}

const message = helloWorld();
// alert(message); // Uncomment to see an alert!
\`\`\`

\`\`\`python
# This is a Python code block
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print(f"Factorial of 5 is: {factorial(5)}")
\`\`\`

## > Blockquotes

> "The only way to do great work is to love what you do."
> \\- Steve Jobs

> This is a multi-line blockquote.
> It can span several paragraphs.
>
> > Nested blockquote example.

## --- Horizontal Rule

You can create a thematic break with three or more hyphens, asterisks, or underscores.

---

***

___

## 📊 Tables

Tables help organize data in rows and columns.

| Header 1 | Header 2 | Header 3     |
| :------- | :------: | -----------: |
| Left     | Center   | Right        |
| Cell 1   | Cell 2   | Cell 3       |
| Data A   | Data B   | Data C       |

---

Feel free to clear this content and experiment with your own Markdown!
Remember to use the **"Clear All"** button to start fresh, or **"Copy to Clipboard"** to save your work.
`;



document.addEventListener('DOMContentLoaded', () => {
    const dragbar = document.getElementById('dragbar');
    const editorPane = document.getElementById('editor-pane');
    const previewPane = document.getElementById('preview-pane');

    if (!dragbar || !editorPane || !previewPane) {
        console.error("Missing dragbar or pane elements");
        return;
    }

    let isDragging = false;

    dragbar.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        document.body.style.cursor = 'col-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const container = document.querySelector('.container');
        const containerOffsetLeft = container.offsetLeft;
        const pointerX = e.clientX - containerOffsetLeft;
        const containerWidth = container.offsetWidth;

        const minEditorWidth = 150;
        const maxEditorWidth = containerWidth - 150;
        const editorWidth = Math.min(Math.max(pointerX, minEditorWidth), maxEditorWidth);

        editorPane.style.flex = `0 0 ${editorWidth}px`;
        previewPane.style.flex = '1';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = 'default';
        }
    });
});



// --- DEBOUNCE FUNCTION ---
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}


function setEditorValuePreservingScroll(value) {
    const scrollTop = editor.scrollTop;
    const scrollLeft = editor.scrollLeft;
    editor.innerText = value;
    editor.scrollTop = scrollTop;
    editor.scrollLeft = scrollLeft;
}


function updatePreview() {
    const scrollTop = editor.scrollTop;
    const scrollLeft = editor.scrollLeft;

    const markdownText = editor.innerText;
    const renderedHtml = marked.parse(markdownText);
    preview.innerHTML = renderedHtml;

    // Restore editor scroll immediately after DOM update
    editor.scrollTop = scrollTop;
    editor.scrollLeft = scrollLeft;
}

// Event listener for the editor input - NOW USING DEBOUNCED VERSION
const debouncedUpdatePreview = debounce(updatePreview, 50); // 250ms delay
editor.addEventListener('input', debouncedUpdatePreview);

// Event listener for the Inject Sample Code button
injectSampleButton.addEventListener('click', () => {
    setEditorValuePreservingScroll(sampleMarkdownCode);
    updatePreview();
});

// Event listener for the Clear All button
clearButton.addEventListener('click', () => {
    editor.innerText='';
    updatePreview();
});

saveButton.addEventListener('click', () => {
    const content = editor.innerText;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown.md'; // You can customize the default filename
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
});

// Event listener for the Copy to Clipboard button
copyButton.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(editor.innerText);
        console.log('Markdown copied to clipboard!');
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = 'Copy to Clipboard';
        }, 1500);
    } catch (err) {
        console.error('Failed to copy Markdown: ', err);
        alert('Failed to copy Markdown. Please copy manually.');
    }
});

// Initial render of the preview with the sample code on app startup
editor.innerText = sampleMarkdownCode;
updatePreview(); // Call immediately on load