export function setTimeoutOnVisible({
  element,
  callback,
  timeout,
  threshold = 0.01,
}: {
  element?: HTMLElement;
  callback: () => void;
  timeout: number;
  threshold?: number;
}) {
  if (!element) {
    return;
  }

  let timeoutId: NodeJS.Timeout | null = null;
  let finished = false;

  // Check if element is already visible at the beginning
  const rect = element.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

  const setupTimeout = () => {
    if (finished) return;

    timeoutId = setTimeout(() => {
      if (finished) return;

      callback();
      timeoutId = null;
      finished = true;
    }, timeout);
  };

  if (isVisible && !timeoutId) setupTimeout();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element is visible, start the timeout
          if (!timeoutId) {
            setupTimeout();
            observer.disconnect();
          }
        } else {
          // Element is no longer visible, clear the timeout
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        }
      });
    },
    { threshold },
  );

  observer.observe(element);

  // Return a cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    observer.disconnect();
  };
}

export function setIntervalOnVisible({
  element,
  callback,
  interval,
  threshold = 0.01,
}: {
  element?: HTMLElement | null;
  callback: () => void;
  interval: number;
  threshold?: number;
  immediate?: boolean;
}) {
  if (!element) {
    return;
  }

  let intervalId: NodeJS.Timeout | null = null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element is visible, start the interval
          if (!intervalId) {
            intervalId = setInterval(callback, interval);
          }
        } else {
          // Element is no longer visible, clear the interval
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      });
    },
    { threshold },
  );

  observer.observe(element);

  // Return a cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    observer.disconnect();
  };
}

export default setTimeoutOnVisible;
