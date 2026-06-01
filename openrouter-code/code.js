let editor;
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' } });
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('container'), {
        value: [
            "def print_title(title):",
            "    print(f\"{title}\\n{'=' * len(title)}\")",
            "",
            "def read_required_string(prompt):",
            "    while True:",
            "        value = input(prompt).strip()",
            "        if value:",
            "            return value",
            "        print(\"[ERR] value is required.\")",
            "",
            "def read_int(prompt):",
            "    return int(read_required_string(prompt))",
            "",
            "print_title(\"Cookie Order\")  # Always NoneType",
            "",
            "name = read_required_string(\"Your name: \")  # Always string",
            "cookie_count = read_int(\"How many cookies would you like?: \")  # Always int",
            "",
            "print(f\"{name} would like {cookie_count} cookies.\")",
            "# Nemo would like 14 cookies.",
        ].join('\n'),
        language: 'python',
        theme: 'vs-dark'
    });
});

const languageSelect = document.getElementById('language-select');
languageSelect.addEventListener('change', function () {
    const selectedLanguage = languageSelect.value;
    monaco.editor.setModelLanguage(editor.getModel(), selectedLanguage);
});
const btnRun = document.getElementById('btnRun');
const contentDiv = document.getElementById('content');

async function fetchLLMModel() {
    try {
        const init = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                "technology": languageSelect.options[languageSelect.selectedIndex].text,
                "code": editor.getValue()
            }),
        };

        btnRun.disabled = true;
        contentDiv.innerHTML = "Thinking...";
        contentDiv.className = "pulse";

        console.log('Request payload:', init);


        // const response = await fetch("https://wbm2bsumis76qttjxq5kgu26zu0docxm.lambda-url.us-east-2.on.aws/", init);
        // const evt = await response.json();
        // console.log('LLM model data:', evt);


        const response = await fetch('https://pl7kv74jbhv3jemwuqqd5xwagm0nnxoq.lambda-url.us-east-2.on.aws/', init);
        const message = await response.json();
        console.log('LLM model data:', message);
        document.getElementById('content').innerHTML = marked.parse(message["content"]);


        btnRun.disabled = false;
        contentDiv.className = "";

    } catch (error) {
        console.error('Error fetching LLM model:', error);
    }
}

document.getElementById('btnRun').addEventListener('click', fetchLLMModel);