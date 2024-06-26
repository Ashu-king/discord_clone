"use client";
import React, { useState } from "react";

const Upload = () => {
  const [file, setFile] = useState<File>();

  //http request

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    try {
      const data = new FormData();
      data.set("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          placeholder="file"
          type="file"
          name="file"
          onChange={(e) => {
            setFile(e.target.files?.[0]);
          }}
        />
        <input type="submit" value="upload" />
      </form>
    </div>
  );
};

export default Upload;
