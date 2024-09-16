import React, { useState, useRef } from "react";

interface AsyncInfiniteScrollProps<T>
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Function to fetch the next page of data.
   * @param lastItem - The last item in the current list.
   * @returns A promise that resolves to an array of items.
   */
  fetchNextPage: (lastItem: T) => Promise<T[]>;

  /**
   * Function to fetch the previous page of data.
   * @param firstItem - The first item in the current list.
   * @returns A promise that resolves to an array of items.
   */
  fetchPreviousPage: (firstItem: T) => Promise<T[]>;

  /**
   * Message to display while loading.
   * @type React.ReactNode
   */
  loadingMessage: React.ReactNode;

  /**
   * Message to display at the end of the list.
   * @type React.ReactNode
   */
  endingMessage: React.ReactNode;

  /**
   * Initial data to display.
   * @type T[]
   */
  initialData: T[];

  /**
   * Number of items to keep in the rendered list.
   * @type number
   * @default 100
   */
  threshold?: number;

  /**
   * Function to render each item.
   * @param item - The item to render.
   * @returns A React node.
   */
  renderItem: (item: T) => React.ReactNode;

  /**
   * Function to generate a unique key for each item.
   * @param item - The item to generate a key for.
   * @returns A unique string key.
   */
  renderKey: (item: T) => string;
}

export function AsyncInfiniteScroller<T>({
  fetchNextPage,
  fetchPreviousPage,
  endingMessage,
  loadingMessage,
  initialData = [],
  threshold = 100,
  renderItem,
  renderKey,
  ...props
}: AsyncInfiniteScrollProps<T>) {
  const nextObserverTarget = useRef(null);
  const previousObserverTarget = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<T | undefined>(
    initialData[initialData.length - 1]
  );
  const firstItemRef = useRef<T | undefined>(initialData[0]);
  const [renderedData, setRenderedData] = useState<T[]>(initialData);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const direction = entries[0]?.target.id;
        if (!lastItemRef.current || !firstItemRef.current) {
          console.warn("No last or first item");
          return;
        }
        if (entries[0]?.isIntersecting && hasNextPage) {
          if (direction === "next") {
            const lastItemId = `scroll-item-${renderKey(lastItemRef.current)}`;

            fetchNextPage(lastItemRef.current)
              .then((data) => {
                setRenderedData((prev) => {
                  const newData = [...prev, ...data].slice(-threshold);
                  lastItemRef.current = newData[newData.length - 1] as T;
                  firstItemRef.current = newData[0] as T;
                  return newData;
                });
                if (data.length > 0) {
                  setHasNextPage(true);
                } else {
                  setHasNextPage(false);
                }
              })
              .finally(() => {
                console.log(lastItemId);
                document.getElementById(lastItemId)?.scrollIntoView(true);
              });
          } else {
            const firstItemId = `scroll-item-${renderKey(
              firstItemRef.current
            )}`;
            fetchPreviousPage(firstItemRef.current)
              .then((data) => {
                setRenderedData((prev) => {
                  const newData = [...data, ...prev].slice(0, threshold);
                  lastItemRef.current = newData[newData.length - 1] as T;
                  firstItemRef.current = newData[0] as T;
                  return newData;
                });
                if (data.length > 0) {
                  setHasPreviousPage(true);
                } else {
                  setHasPreviousPage(false);
                }
              })
              .finally(() => {
                document.getElementById(firstItemId)?.scrollIntoView(false);
              });
          }
        }
      },
      { threshold: 1 }
    );

    if (nextObserverTarget.current) {
      observer.observe(nextObserverTarget.current);
    }

    if (previousObserverTarget.current) {
      observer.observe(previousObserverTarget.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div {...props} ref={containerRef}>
      {hasPreviousPage ? loadingMessage : endingMessage}
      <div ref={previousObserverTarget} id="previous" />
      {renderedData.map((item) => (
        <div key={renderKey(item)} id={`scroll-item-${renderKey(item)}`}>
          {renderItem(item)}
        </div>
      ))}
      <div ref={nextObserverTarget} id="next" />
      {hasNextPage ? loadingMessage : endingMessage}
    </div>
  );
}
