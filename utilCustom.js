const fs = require('fs');
const path = require('path');

module.exports.getdir = async (dir, splitter) =>
{
    let result = [];
    await getstatic(dir, result, '', splitter);
    return result;
}


function getsuffix(name)
{
    for (let i = name.length - 1; i > 0; i--)
    {
        if (name[i] == '.')
        {
            return name.substr(i + 1);
        }
    }
    return null;
}

function getstatic(dir, array, name, splitter)
{
    return new Promise((resolve, reject) =>
    {
        fs.readdir(dir, async (err, files) =>
        {
            for (let i in files)
            {
                let filepath = path.join(dir, files[i]);
                let pathname;
                if (splitter)
                {
                    pathname = name + splitter + files[i];
                }
                else
                {
                    pathname = filepath;
                }
                await (new Promise((resolve, reject) =>
                {
                    fs.stat(filepath, async (err, stats) =>
                    {
                        if (stats.isDirectory())
                        {
                            await getstatic(filepath, array, pathname, splitter);
                        }
                        else
                        {
                            array.push({ name: pathname, path: filepath, type: getsuffix(pathname) });
                        }
                        resolve(true);
                    })
                }))
            }
            resolve(true);
        })
    })
}