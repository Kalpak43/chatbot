import React, { JSX } from "react";
import { markdownRegex } from "../data/markdown";

function splitByFirstMatch(markdown: string, tag: string) {
  const match = markdown.match(markdownRegex[tag].split!);

  return [
    markdown.substring(0, match!.index),
    match![0],
    markdown.substring(match!.index! + match![0].length),
  ];
}

const parseMarkdown = (
  markdown: string,
  isParent: boolean = false
): JSX.Element => {
  if (markdownRegex[">"].exp.test(markdown)) {
    return (
      <blockquote>
        {parseMarkdown(markdown.replace(markdownRegex[">"].replace, ""))}
      </blockquote>
    );
  }

  if (markdownRegex["ul"].exp.test(markdown)) {
    return (
      <li className="list-disc">
        {parseMarkdown(markdown.replace(markdownRegex["ul"].replace, ""))}
      </li>
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

  if (markdownRegex["---"].exp.test(markdown)) {
    return (
      <>
        <hr />
        {parseMarkdown(markdown.replace(markdownRegex["---"].replace, "$1"))}
      </>
    );
  }

  if (markdownRegex["**"].exp.test(markdown)) {
    const parts = splitByFirstMatch(markdown, "**");

    return isParent ? (
      <p>
        {parseMarkdown(parts[0])}
        <strong>{parts[1].replace(markdownRegex["**"].replace, "$1")}</strong>
        {parseMarkdown(parts[2])}
      </p>
    ) : (
      <>
        {parseMarkdown(parts[0])}
        <strong>{parts[1].replace(markdownRegex["**"].replace, "$1")}</strong>
        {parseMarkdown(parts[2])}
      </>
    );
  }

  if (markdownRegex["*"].exp.test(markdown)) {
    const parts = splitByFirstMatch(markdown, "*");

    return isParent ? (
      <p>
        {parseMarkdown(parts[0])}
        <em>{parts[1].replace(markdownRegex["*"].replace, "$1")}</em>
        {parseMarkdown(parts[2])}
      </p>
    ) : (
      <>
        {parseMarkdown(parts[0])}
        <em>{parts[1].replace(markdownRegex["*"].replace, "$1")}</em>
        {parseMarkdown(parts[2])}
      </>
    );
  }

  if (markdownRegex["~~"].exp.test(markdown)) {
    const parts = splitByFirstMatch(markdown, "~~");

    return isParent ? (
      <p>
        {parseMarkdown(parts[0])}
        <del>{parts[1].replace(markdownRegex["~~"].replace, "$1")}</del>
        {parseMarkdown(parts[2])}
      </p>
    ) : (
      <>
        {parseMarkdown(parts[0])}
        <del>{parts[1].replace(markdownRegex["~~"].replace, "$1")}</del>
        {parseMarkdown(parts[2])}
      </>
    );
  }

  if (markdownRegex["`"].exp.test(markdown)) {
    const parts = splitByFirstMatch(markdown, "`");

    return isParent ? (
      <p>
        {parseMarkdown(parts[0])}
        <code>{parts[1].replace(markdownRegex["`"].replace, "$1")}</code>
        {parseMarkdown(parts[2])}
      </p>
    ) : (
      <>
        {parseMarkdown(parts[0])}
        <code>{parts[1].replace(markdownRegex["`"].replace, "$1")}</code>
        {parseMarkdown(parts[2])}
      </>
    );
  }

  return isParent ? <p>{markdown}</p> : <>{markdown}</>;
};

type ListItem = {
  content: string;
  level: number;
  children: ListItem[];
};

function Markdown({ children }: { children: React.ReactNode }) {
  const getIndentationLevel = (line: string): number => {
    const match = line.match(/^(\s*)[*+-]/);
    return match ? Math.floor(match[1].length / 2) : 0;
  };

  const buildListTree = (items: string[]): ListItem[] => {
    const root: ListItem[] = [];
    const stack: ListItem[][] = [root];
    let currentLevel = 0;

    items.forEach((item) => {
      const level = getIndentationLevel(item);
      const content = item.trim().replace(/^[*+-]\s/, "");
      const listItem: ListItem = { content, level, children: [] };

      while (currentLevel > level) {
        stack.pop();
        currentLevel--;
      }

      while (currentLevel < level) {
        const newLevel: ListItem[] = [];
        if (stack[stack.length - 1].length > 0) {
          stack[stack.length - 1][stack[stack.length - 1].length - 1].children =
            newLevel;
        }
        stack.push(newLevel);
        currentLevel++;
      }

      stack[stack.length - 1].push(listItem);
    });

    return root;
  };

  const renderListTree = (items: ListItem[]): JSX.Element => {
    return (
      <ul className="list-disc pl-6">
        {items.map((item, index) => (
          <li key={index}>
            {parseMarkdown(item.content)}
            {item.children.length > 0 && renderListTree(item.children)}
          </li>
        ))}
      </ul>
    );
  };

  const processLines = (lines: string[]) => {
    // console.log(lines)
    const result: JSX.Element[] = [];
    let currentList: string[] = [];

    const flushList = () => {
      const listTree = buildListTree(currentList);
      result.push(
        <React.Fragment key={result.length}>
          {renderListTree(listTree)}
        </React.Fragment>
      );
      currentList = [];
    };

    lines.forEach((line, i) => {
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ") || line.trim().startsWith("+ ")) {
        currentList.push(line);
      } else {
        currentList.length > 0 && flushList();
        if (line !== "") {
          result.push(
            <React.Fragment key={i}>{parseMarkdown(line, true)}</React.Fragment>
          );
        }
      }
    });

    currentList.length > 0 && flushList();

    return result;
  };

  return (
    <div className=" h-full overflow-y-auto p-4">
      <div className="">
        {/* {markdownContent.split("\n").map((line, i) => {
          return <p key={i}>{line}</p>;
        })} */}

        {children && processLines(children.toString().split("\n"))}
      </div>
    </div>
  );
}

export default Markdown;
