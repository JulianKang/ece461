import * as fsPromise from 'fs/promises'; 
import test from 'node:test';

export const readURLs = async (fileName: string) => {
    const urls: string[] = [];
    await fsPromise.open(fileName, 'r')
        .then(async (response) => {
            for await (const line of response.readLines()){
                urls.push(line);
            }
        })
        .catch((error) => {
            console.error(`File not found at: ${fileName}`)
        });
    return urls;
};
//
/*
export const testURLs = async () => {
    var urls = await readURLs("C:/Users/hdogg/Desktop/ECE 461/urlFile.txt");
    console.log(urls);
}

testURLs();*/
