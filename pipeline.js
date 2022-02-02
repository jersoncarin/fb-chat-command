const pipeline = (pipes, ...args) => {
  const pipelineCallback = pipes
    .slice()
    .reverse()
    .reduce(
      (next, pipe) =>
        (...args) =>
          typeof pipe(next) === "function"
            ? pipe(next)(...args)
            : pipe(...args),
      (n) => n
    );

  return pipelineCallback(...args);
};

module.exports = pipeline;
