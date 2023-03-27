import { GetStaticProps } from "next";
import { useState } from "react";

type FolderNode = {
  type: "folder",
  name: string,
  children: (FolderNode | FileNode)[],
  depth: number,
}
type FileNode = {
  type: "file",
  name: string,
  linkPath: string
  depth: number,
}
const depthColorMap:{[key:number]:string} = {
  0: "text-white border-white",
  1: "text-blue-300 border-blue-300",
  2: "text-green-300 border-green-300",
  3: "text-yellow-300 border-yellow-300",
  4: "text-red-300 border-red-300",
  5: "text-purple-300 border-purple-300",
  6: "text-pink-300 border-pink-300",
  7: "text-gray-300 border-gray-300",
  8: "text-indigo-300 border-indigo-300",
  9: "text-orange-300 border-orange-300",
  10: "text-teal-300 border-teal-300",
  // hopefully you don't have more than 10 subfolders
}

type FileTreeNode = FolderNode | FileNode;

const Card = (props: { file: FileNode }) => {
  return (
    <>
      <a
        href={props.file.linkPath.replaceAll("[", "%5B").replaceAll("]", "%5D")}
        className={`${props.file.depth>0 && props.file.depth<12 && depthColorMap[props.file.depth-1]} border border-white px-4 py-2 my-1 break-words rounded-md lg:hover:border-2 transition-all`}
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
        className={`text-2xl ${folder.depth<11 && depthColorMap[folder.depth]} ${vis ? "font-bold" : "font-light"
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



  const dfs = (folder: string, name: string, depth: number): FileTreeNode => {
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
        subTree.push(dfs(folder + "/" + f, f, depth + 1));
      })
      const newNode: FolderNode = {
        type: "folder",
        name: name,
        children: subTree,
        depth: depth,
      }
      return newNode;
    } else {
      const newNode: FileNode = {
        type: "file",
        name: name,
        linkPath: folder.slice(8),
        depth: depth,
      }
      return newNode;
    }
  };

  const tree = dfs("./public", "root", 0);
  return {
    props: {
      tree
    }
  }
};
