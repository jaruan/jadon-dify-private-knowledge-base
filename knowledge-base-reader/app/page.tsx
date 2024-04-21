"use client";

export default function Home() {
  const onSubmit = () => {
    console.log("1");
    const message = document.getElementById("input");
    console.log(message);
  };

  return (
    <main>
      <input id="input" type="text" />
      <button type="submit" onClick={() => onSubmit}>
        提交
      </button>
    </main>
  );
}
