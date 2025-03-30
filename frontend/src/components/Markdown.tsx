import React, { JSX, useEffect } from "react";
import { markdownRegex } from "../data/markdown";

function splitByFirstMatch(markdown: string, tag: string) {
  const match = markdown.match(markdownRegex[tag].split!);

  return [
    markdown.substring(0, match!.index),
    match![0],
    markdown.substring(match!.index! + match![0].length),
  ];
}

const parseMarkdown = (markdown: string): JSX.Element => {
  if (markdownRegex[">"].exp.test(markdown)) {
    return (
      <blockquote>
        {parseMarkdown(markdown.replace(markdownRegex[">"].replace, ""))}
      </blockquote>
    );
  }

  if (markdownRegex["#"].exp.test(markdown)) {
    return (
      <h1>{parseMarkdown(markdown.replace(markdownRegex["#"].replace, ""))}</h1>
    );
  }

  if (markdownRegex["##"].exp.test(markdown)) {
    return (
      <h2>
        {parseMarkdown(markdown.replace(markdownRegex["##"].replace, ""))}
      </h2>
    );
  }

  if (markdownRegex["###"].exp.test(markdown)) {
    return (
      <h3>
        {parseMarkdown(markdown.replace(markdownRegex["###"].replace, ""))}
      </h3>
    );
  }

  if (markdownRegex["####"].exp.test(markdown)) {
    return (
      <h4>
        {parseMarkdown(markdown.replace(markdownRegex["####"].replace, ""))}
      </h4>
    );
  }

  if (markdownRegex["#####"].exp.test(markdown)) {
    return (
      <h5>
        {parseMarkdown(markdown.replace(markdownRegex["#####"].replace, ""))}
      </h5>
    );
  }

  if (markdownRegex["######"].exp.test(markdown)) {
    return (
      <h6>
        {parseMarkdown(markdown.replace(markdownRegex["######"].replace, ""))}
      </h6>
    );
  }

  if (markdownRegex["**"].exp.test(markdown)) {
    const parts = splitByFirstMatch(markdown, "**");

    return (
      <>
        {parseMarkdown(parts[0])}
        <strong>{parts[1].replace(markdownRegex["**"].replace, "$1")}</strong>
        {parseMarkdown(parts[2])}
      </>
    );
  }

  if (markdownRegex["*"].exp.test(markdown)) {
    const parts = splitByFirstMatch(markdown, "*");

    return (
      <>
        {parseMarkdown(parts[0])}
        <em>{parts[1].replace(markdownRegex["*"].replace, "$1")}</em>
        {parseMarkdown(parts[2])}
      </>
    );
  }

  if (markdownRegex["~~"].exp.test(markdown)) {
    const parts = splitByFirstMatch(markdown, "~~");

    return (
      <>
        {parseMarkdown(parts[0])}
        <del>{parts[1].replace(markdownRegex["~~"].replace, "$1")}</del>
        {parseMarkdown(parts[2])}
      </>
    );
  }

  if (markdownRegex["`"].exp.test(markdown)) {
    const parts = splitByFirstMatch(markdown, "`");

    return (
      <>
        {parseMarkdown(parts[0])}
        <code>{parts[1].replace(markdownRegex["`"].replace, "$1")}</code>
        {parseMarkdown(parts[2])}
      </>
    );
  }

  if (markdownRegex["---"].exp.test(markdown)) {
    return (
      <>
        <hr />
        {parseMarkdown(markdown.replace(markdownRegex["---"].replace, "$1"))}
      </>
    );
  }

  return <>{markdown}</>;
};

function Markdown({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (children)
      console.log(markdownRegex["~~"].exp.test(children.toString()));
    console.log(
      "SPLIT: ",
      children &&
        children.toString().split("\n")[0].split(markdownRegex["~~"].split!)
    );
  }, []);

  return (
    <div className=" h-full overflow-y-auto p-4">
      <div className="">
        {/* {markdownContent.split("\n").map((line, i) => {
          return <p key={i}>{line}</p>;
        })} */}

        {children &&
          children
            .toString()
            .split("\n")
            .map((line) => {
              return parseMarkdown(line);
            })}
      </div>
    </div>
  );
}

export default Markdown;
