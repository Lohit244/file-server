import { GetStaticProps } from "next";
import { useState } from "react";

type FolderNode = {
  type: "folder",
  name: string,
  children: (FolderNode | FileNode)[],
}
type FileNode = {
  type: "file",
  name: string,
  linkPath: string
}

type FileTreeNode = FolderNode | FileNode;

const Card = (props: { file: FileNode }) => {
  return (
    <>
      <a
        href={props.file.linkPath.replaceAll("[", "%5B").replaceAll("]", "%5D")}
        className="border border-white px-4 py-2 my-1 break-words rounded-md lg:hover:border-2 transition-all"
      >
        {props.file.name}
      </a>
    </>
  );
};

const Subfolder = (props: { folder: FolderNode }) => {
  const folder = props.folder;
  const [vis, setVis] = useState(false);
  return (
    <div className="ml-4">
      <h1
        className={`text-2xl ${vis ? "font-bold" : "font-light"
          } my-4 max-w-[20ch] sm:max-w-[30ch] md:max-w-[80%] break-words w-max cursor-pointer lg:hover:tracking-wide transition-all`}
        onClick={() => {
          setVis(!vis);
        }}
      >
        {folder.name} {vis ? "←" : "→"}
      </h1>
      <div className={`flex flex-col ${vis ? "" : "hidden"}`}>
        {folder.children.map((f) => {
          if (f.type == "folder") {
            return <Subfolder folder={f} key={f.name} />;
          }
          return <Card file={f} key={f.linkPath} />;
        })}
      </div>
    </div>
  );
};
export default function Home(props: { tree: FileTreeNode }) {


  return (
    <div className="flex flex-col m-4">
      <h1 className="text-4xl font-black mt-4 mb-8">
        Welcome to The File Server
      </h1>
      {props.tree.type == "folder" ? (
        <Subfolder folder={props.tree} key={props.tree.name} />
      ) : (
        <Card file={props.tree} key={props.tree.linkPath} />
      )
      }

    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const fs = require("fs");



  const dfs = (folder: string, name: string): FileTreeNode => {
    if (!fs.existsSync(folder)) {
      return {
        type: "file",
        name: "404",
        linkPath: "./public"
      } as FileNode;
    }
    if (fs.statSync(folder).isDirectory()) {
      const subFiles = fs.readdirSync(folder);
      const subTree: FileTreeNode[] = [];
      subFiles.forEach((f: string) => {
        subTree.push(dfs(folder + "/" + f, f));
      })
      const newNode: FolderNode = {
        type: "folder",
        name: name,
        children: subTree,
      }
      return newNode;
    } else {
      const newNode: FileNode = {
        type: "file",
        name: name,
        linkPath: folder.slice(8),
      }
      return newNode;
    }
  };

  const tree = dfs("./public", "root");
  return {
    props: {
      tree
    }
  }
};
