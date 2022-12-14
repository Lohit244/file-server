import { GetStaticProps } from "next";
import { useState } from "react";

export default function Home(props: { paths: string[] }) {
  const structureddata: { [key: string]: string[] } = {};
  const m = new Set<string>();
  props.paths.forEach((f) => {
    if (f.indexOf("/") != -1) {
      const index = f.search("/");
      if (structureddata[f.slice(0, index)]) {
        structureddata[f.slice(0, index)].push(f);
      } else {
        structureddata[f.slice(0, index)] = [];
        structureddata[f.slice(0, index)].push(f);
      }
      m.add(f.split("/")[0]);
    } else {
      if (structureddata["root"]) {
        structureddata["root"].push(f);
      } else {
        structureddata["root"] = [];
        structureddata["root"].push(f);
        m.add("root");
      }
    }
  });
  const marr = Array.from(m);

  const Card = (props: { file: string }) => {
    return (
      <>
        <a
          href={props.file.replaceAll("[", "%5B").replaceAll("]", "%5D")}
          className="border border-white px-4 py-2 my-1 break-words rounded-md lg:hover:border-2 transition-all"
        >
          {props.file}
        </a>
      </>
    );
  };

  const Subfolder = (props: { folder: string }) => {
    const folder = props.folder;
    const [vis, setVis] = useState(false);
    return (
      <>
        <h1
          className={`text-2xl ${
            vis ? "font-bold" : "font-light"
          } my-4 max-w-[20ch] sm:max-w-[30ch] md:max-w-[80%] break-words w-max cursor-pointer lg:hover:tracking-wide transition-all`}
          onClick={() => {
            setVis(!vis);
          }}
        >
          {folder} {vis ? "←" : "→"}
        </h1>
        <div className={`flex flex-col ${vis ? "" : "hidden"}`}>
          {structureddata[folder].map((f) => {
            return <Card file={f} key={f} />;
          })}
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col m-4">
      <h1 className="text-4xl font-black mt-4 mb-8">
        Welcome to The File Server
      </h1>
      {marr.map((folder) => (
        <Subfolder folder={folder} key={folder} />
      ))}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const fs = require("fs");
  const files: string[] = [];
  const dfs = (folder: string) => {
    // console.log("ran @", folder);
    if (fs.statSync(folder).isDirectory()) {
      const t = fs.readdirSync(folder);
      t.forEach((f: string) => {
        dfs(folder + "/" + f);
        // console.log("found ", f);
      });
    } else {
      files.push(folder.slice(9));
    }
  };
  dfs("./public");
  return {
    props: {
      paths: files,
    },
    revalidate: 80,
  };
};
