import React, { useEffect } from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function Textarea({ value, onKeyDown, onChange, ...props }: TextareaProps) {
  useEffect(() => {
    const textarea = document.querySelector("textarea");

    if (textarea) {
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, []);

  const autoResize = (
    e:
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.FormEvent<HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = Math.min(target.scrollHeight, 200) + "px"; // optional cap
  };

  return (
    <textarea
      {...props}
      value={value}
      onKeyDown={onKeyDown}
      onChange={(e) => {
        onChange && onChange(e);
        autoResize(e);
      }}
      onInput={autoResize}
      placeholder="Type your message..."
      className={`textarea textarea-bordered flex-1 w-full resize-none overflow-y-auto ${
        props.className || ""
      }`}
      rows={1}
      style={{ maxHeight: "200px", ...(props.style || {}) }}
    />
  );
}

export default Textarea;
