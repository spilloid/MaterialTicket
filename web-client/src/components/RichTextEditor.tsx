// ./components/RichTextEditor.tsx
// Lightweight WYSIWYG editor (TipTap) used for composing HTML emails from a
// ticket. Emits HTML via onChange; the backend sanitizes before send + store.
import React from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Box, ToggleButton, ToggleButtonGroup, Divider, Tooltip } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import LinkIcon from "@mui/icons-material/Link";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

function Toolbar({ editor }: { editor: Editor }) {
  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, p: 0.5, borderBottom: 1, borderColor: "divider" }}>
      <ToggleButtonGroup size="small">
        <ToggleButton value="bold" selected={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Tooltip title="Bold"><FormatBoldIcon fontSize="small" /></Tooltip>
        </ToggleButton>
        <ToggleButton value="italic" selected={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Tooltip title="Italic"><FormatItalicIcon fontSize="small" /></Tooltip>
        </ToggleButton>
        <ToggleButton value="strike" selected={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Tooltip title="Strikethrough"><FormatUnderlinedIcon fontSize="small" /></Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
      <Divider orientation="vertical" flexItem />
      <ToggleButtonGroup size="small">
        <ToggleButton value="bullet" selected={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <Tooltip title="Bulleted list"><FormatListBulletedIcon fontSize="small" /></Tooltip>
        </ToggleButton>
        <ToggleButton value="ordered" selected={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <Tooltip title="Numbered list"><FormatListNumberedIcon fontSize="small" /></Tooltip>
        </ToggleButton>
        <ToggleButton value="quote" selected={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Tooltip title="Quote"><FormatQuoteIcon fontSize="small" /></Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
      <Divider orientation="vertical" flexItem />
      <ToggleButton size="small" value="link" selected={editor.isActive("link")} onClick={setLink}>
        <Tooltip title="Insert link"><LinkIcon fontSize="small" /></Tooltip>
      </ToggleButton>
    </Box>
  );
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, minHeight = 180 }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
      {editor && <Toolbar editor={editor} />}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          minHeight,
          cursor: "text",
          "& .ProseMirror": { outline: "none", minHeight: minHeight - 16 },
          "& .ProseMirror p": { my: 0.5 },
          "& .ProseMirror:focus": { outline: "none" },
          "& .ProseMirror blockquote": { borderLeft: 3, borderColor: "divider", pl: 1.5, color: "text.secondary", ml: 0 },
        }}
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};

export default RichTextEditor;
