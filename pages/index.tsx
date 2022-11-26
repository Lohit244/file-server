import { GetServerSideProps } from "next";

export default function Home(props: { paths: string[] }) {
  const Card = (props: { file: string }) => {
    return (
      <>
        <a
          href={props.file}
          className="border-2 border-white px-4 py-2 my-1 break-words"
        >
          {props.file}
        </a>
      </>
    );
  };
  return (
    <div className="flex flex-col m-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to The File Server</h1>
      {props.paths.map((file) => (
        <Card key={file} file={file} />
      ))}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
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
      files.push(folder.slice(8));
    }
  };
  dfs("./public");
  return {
    props: {
      paths: files,
    },
  };
};
