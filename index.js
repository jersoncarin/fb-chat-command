const chat = require("./chat");
const fs = require("fs");
const chalk = require("chalk");

if (!fs.existsSync(`${__dirname}/state.session`)) {
  console.log(
    `${chalk.red(
      "Error: "
    )}Session has not found, please run authenticate command (yarn authenticate|npm authenticate)`
  );
  return;
}

const listenEvents = process.env.LISTEN_EVENT ? process.env.LISTEN_EVENT : true;
const selfListen = process.env.LISTEN_EVENT ? process.env.SELF_LISTEN : true;

const commands = [];
let options = {};

const add = (callback, option) => commands.push({ callback, option });
const list = () => commands.map((command) => command.option);

const init = (option = {}) => {
  options = { ...options, ...option };

  try {
    const appState = JSON.parse(
      Buffer.from(
        fs.readFileSync(`${__dirname}/state.session`, "utf-8"),
        "base64"
      )
    );

    const fbOption = JSON.parse(JSON.stringify(options));
    delete fbOption["prefix"];

    chat({ appState }, { listenEvents, selfListen, ...fbOption }, (err, fb) => {
      if (err) return console.log(`${chalk.red("Error: ")}${err}`);

      const defaultPrefix = options.prefix === undefined ? "/" : options.prefix;

      fb.listen(async (err, event) => {
        if (err) return console.log(`${chalk.red("Error: ")}${err}`);

        commands.forEach((command) => {
          if (
            typeof command.callback === "function" &&
            event.body !== undefined
          ) {
            const prefix = event.body.substring(0, 1);

            if (command.option.command === undefined) {
              return console.log(
                `${chalk.red(
                  "Error: "
                )}No command defined, you should put atleast one command.`
              );
            }

            const commandPrefix =
              command.option.prefix === undefined
                ? defaultPrefix
                : command.option.prefix;

            const bodyCommand = event.body.substring(
              1,
              command.option.command.length + 1
            );

            if (
              commandPrefix === prefix &&
              bodyCommand === command.option.command
            ) {
              const body = event.body
                .substring(command.option.command.length + 1)
                .trim();

              command.callback(body, event, fb);
            }
          }
        });
      });
    });
  } catch (err) {
    console.log(`${chalk.red("Error: ")}${err.message}`);
    return;
  }
};

process.on("uncaughtException", (err) => {
  return console.log(`${chalk.red("Error: ")}${err.message}`);
});

module.exports = {
  add,
  init,
  list,
};
