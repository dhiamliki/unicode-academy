import { useEffect, useEffectEvent, useRef } from "react";
import { Compartment, EditorState } from "@codemirror/state";
import { css as cssLanguage } from "@codemirror/lang-css";
import { html as htmlLanguage } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { python as pythonLanguage } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, lineNumbers } from "@codemirror/view";

type CodeEditorLanguage = "html" | "css" | "js" | "python" | "java";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: CodeEditorLanguage;
  editorCode?: string;
  setEditorCode?: (value: string) => void;
};

const languageCompartment = new Compartment();

export default function CodeEditor({
  value,
  onChange,
  language,
}: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const handleChange = useEffectEvent(onChange);

  useEffect(() => {
    if (!hostRef.current || viewRef.current) {
      return;
    }

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          EditorState.tabSize.of(2),
          EditorView.lineWrapping,
          oneDark,
          EditorView.theme({
            "&": {
              height: "100%",
              fontSize: "13px",
            },
          }),
          languageCompartment.of(resolveLanguageExtension(language)),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              handleChange(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: hostRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }

    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }

    view.dispatch({
      effects: languageCompartment.reconfigure(resolveLanguageExtension(language)),
    });
  }, [language]);

  return <div ref={hostRef} className="code-editor-shell" />;
}

function resolveLanguageExtension(language: CodeEditorLanguage) {
  switch (language) {
    case "html":
      return htmlLanguage();
    case "css":
      return cssLanguage();
    case "js":
      return javascript();
    case "python":
      return pythonLanguage();
    case "java":
    default:
      return [];
  }
}
