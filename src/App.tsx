import { InfiniteScroller, AsyncInfiniteScroller } from "../package/index";
import { useState } from "react";

function App() {
  const [elements, setElements] = useState([...Array(50).keys()]);

  function add5() {
    setTimeout(
      () => setElements((array) => [...Array(array.length + 5).keys()]),
      500
    );
  }

  function fetchNextPage(lastItem: number): Promise<number[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Array.from({ length: 10 }, (_, i) => +lastItem + i + 1)); // 修改此处
      }, 500);
    });
  }

  function fetchPreviousPage(lastItem: number): Promise<number[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          Array.from({ length: 10 }, (_, i) => +lastItem - i - 1).reverse()
        ); // 修改此处
      }, 500);
    });
  }

  return (
    <main className="grid grid-cols-3">
      <div className="flex h-screen flex-col bg-black text-center text-xl text-white">
        <h1 className="underline">Normal Scroll</h1>
        <InfiniteScroller
          fetchNextPage={add5}
          hasNextPage={true}
          loadingMessage={<p>Loading...</p>}
          endingMessage={<p>The beginning of time...</p>}
          className="overflow-auto"
        >
          {elements.map((el) => (
            <div key={crypto.randomUUID()}>{el}</div>
          ))}
        </InfiniteScroller>
      </div>
      <div className="flex h-screen flex-col bg-black text-center text-xl text-white">
        <h1 className="underline">Inverse Scroll</h1>
        <InfiniteScroller
          fetchNextPage={add5}
          hasNextPage={true}
          loadingMessage={<p>Loading...</p>}
          endingMessage={<p>The beginning of time...</p>}
          className="flex flex-1 flex-col-reverse overflow-auto"
        >
          {elements.map((el) => (
            <div key={crypto.randomUUID()}>{el}</div>
          ))}
        </InfiniteScroller>
      </div>
      <div className="flex h-screen flex-col bg-black text-center text-xl text-white">
        <h1 className="underline">Inverse Scroll</h1>
        <AsyncInfiniteScroller<number>
          fetchNextPage={fetchNextPage}
          loadingMessage={<p>Loading...</p>}
          endingMessage={<p>The beginning of time...</p>}
          className="flex flex-1 flex-col-reverse overflow-auto"
          fetchPreviousPage={fetchPreviousPage}
          initialData={[...Array(50).keys()] as number[]}
          renderItem={(el) => <div key={crypto.randomUUID()}>{el}</div>}
          renderKey={(el) => el.toString()}
        />
      </div>
    </main>
  );
}

export default App;
