const fs = require("fs");
const chalk = require("chalk");
const { resolve, sep, join } = require("path");

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
        },
        "force": {
            alias: "f",
            describe: "overwrite all existings files",
            type:"boolean",
            default: false
        }
    })
    .positional("path", {
        describe: "path to generate component folder",
        type:"string",
    })
    .help()
    .version()

const relativeTemplatePath = (folder, filePath) => resolve(filePath).replace(folder + sep, "");

exports.handler = argv => {
    const {complex, language, basePath, force} = argv;
    const path = resolve(basePath, argv.path);
    console.log("complex", complex);
    console.log("language", language);
    console.log("basePath", basePath);
    console.log("force", force);
    const componentName = path.split(sep).pop();

    const processfiles = folders => {
        try {
            const allFiles = getAllFiles(folders);
            fs.mkdirSync(`${path}`, { recursive: true })
            allFiles.filter(([f]) => fs.lstatSync(f).isDirectory()).forEach(([f, templateDir]) => {
                const dir = replaceName(join(path, relativeTemplatePath(templateDir, f)), componentName);
                fs.mkdirSync(dir, { recursive: true })
                console.log(`${chalk.cyan(dir)} ${chalk.green("OK !")}`);
            });
            allFiles.filter(([f]) => fs.lstatSync(f).isFile()).forEach(([f, templateDir])  => {
                const file = replaceName(join(path, relativeTemplatePath(templateDir, f)), componentName);
                const content = fs.readFileSync(f, "utf8")
                try {
                    fs.writeFileSync(file, replaceName(content, componentName), { flag: 'wx' });
                } catch (e) {
                    if (e.code !== 'EEXIST') {
                        throw e;
                    }
                    if (force) {
                        fs.writeFileSync(file, replaceName(content, componentName));
                    }
                }
                console.log(`${chalk.cyan(file)} ${chalk.green("OK !")}`);
            });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const templateFolder = resolve(__dirname, `../templates/${language}`);
    console.log(`generating ${complex ? "complex": "basic"} component ${chalk.yellow(componentName)} at ${chalk.cyan(path)}...`);
    const files = [resolve(templateFolder, "basic")];
    if (complex) {
        files.push(resolve(templateFolder, "complex"));
    }
    processfiles(files);
};

const getAllFiles = (folders) => Object.values(
    Object.fromEntries(
        folders.flatMap(
            src => require("glob")
                .sync(src + "/**/*")
                .map(f => [relativeTemplatePath(src, f), [f, src]])
        )
    )
);


const replaceName = (str, name) => str
    .replace(new RegExp("__Name", "g"), upperFirst(name))
    .replace(new RegExp("__name", "g"), lowerFirst(name))

const upperFirst = name => name.charAt(0).toUpperCase() + name.slice(1);
const lowerFirst = name => name.charAt(0).toLowerCase() + name.slice(1);