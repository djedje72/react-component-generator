const fs = require("fs");
const chalk = require("chalk");

exports.command = "$0 <path>";
exports.aliases = [];
exports.desc = "generate axa react component";
exports.builder = yargs => yargs
    .option({
        "complex" : {
            alias: "c",
            describe: "generate complex component",
            type:"boolean",
            default: false
        },
        "basePath" : {
            alias: "p",
            describe: "base path to generate component",
            type:"string",
            default: "src"
        },
        "language": {
            alias: "l",
            describe: "target language",
            choices: ["js", "ts"],
            default: "js"
        }
    })
    .positional("path", {
        describe: "path to generate component folder",
        type:"string",
    })
    .help()
    .version()
exports.handler = argv => {
    const { resolve, sep, join } = require("path");
    const {complex, language, basePath} = argv;
    const path = resolve(basePath, argv.path);
    console.log("complex", complex);
    console.log("language", language);
    console.log("basePath", basePath);
    const componentName = path.split(sep).pop();
    // for local debugging
    // path = resolve(__dirname, "../dist");

    const processfiles = (folder) => getAllFiles(folder, (err, res) => {
        if (err) {
            console.error("Error", err);
        } else {
            fs.mkdirSync(`${path}`, { recursive: true })
            const relativeTemplatePath = f => resolve(f).replace(folder + sep, "");
            res.filter(f => fs.lstatSync(f).isDirectory()).forEach(f => {
                const dir = replaceName(join(path, relativeTemplatePath(f)), componentName);
                fs.mkdirSync(dir, { recursive: true })
                console.log(`${chalk.cyan(dir)} ${chalk.green("OK !")}`);
            });
            res.filter(f => fs.lstatSync(f).isFile()).forEach(f => {
                const file = replaceName(join(path, relativeTemplatePath(f)), componentName);
                const content = fs.readFileSync(f, "utf8")
                try {
                    fs.writeFileSync(file, replaceName(content, componentName), { flag: 'wx' });
                } catch (e) {
                    if (e.code !== 'EEXIST') {
                        throw err;
                    }
                }
                console.log(`${chalk.cyan(file)} ${chalk.green("OK !")}`);
            });
        }
    });

    const templateFolder = resolve(__dirname, `../templates/${language}`);
    console.log(`generating ${complex ? "complex": "basic"} component ${chalk.yellow(componentName)} at ${chalk.cyan(path)}...`);
    const basicFolder = resolve(templateFolder, "basic");
    processfiles(basicFolder);
    if (complex) {
        const complexFolder = resolve(templateFolder, "complex");
        processfiles(complexFolder);
    }
};

const getAllFiles = (src, callback) => {
    require("glob")(src + "/**/*", callback);
};


const replaceName = (str, name) => str
    .replace(new RegExp("__Name", "g"), upperFirst(name))
    .replace(new RegExp("__name", "g"), lowerFirst(name))

const upperFirst = name => name.charAt(0).toUpperCase() + name.slice(1);
const lowerFirst = name => name.charAt(0).toLowerCase() + name.slice(1);