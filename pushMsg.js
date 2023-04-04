const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');


const type = process.argv[2]

console.log(`running pushMsg with type ${type}`)

const url = 'http://localhost:8080/api/hoteltime'

const run = async (type) => {

    const filepath = path.join(process.cwd(), type === 'small' ? 'smallJson.json' : 'largeJson.json');

    console.log(`loading ${filepath}`)

    const json = await new Promise((resolve, reject) => {
        fs.readFile(filepath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    });


    console.log(JSON.stringify(json).slice(0,50))

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: json,
    })

    console.log(`json send to ${url} with status ${res.status}`)
}


run(type).catch((e) => console.error(e))
