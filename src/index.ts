import dotenv from 'dotenv'
dotenv.config()
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import express from 'express';
import User from './schema.js';
import mongoose from "mongoose";

const app = express();

const server = new McpServer({
    name: 'Weather Server',
    version: '1.0.0',
});

async function getWeatherByCityName(city: string){
    if(city.toLowerCase() === 'patiala') 
        return {temp: '32C', forecase: 'chances of high rain'}

    if(city.toLowerCase() === 'jalna') 
        return {temp: '25C', forecase: 'cloudy'}

    if(city.toLowerCase() === 'mumbai') 
        return {temp: '42C', forecase: 'jal jaoge'}

    return {temp: null, error: 'unable to get data'}
}

async function connectToMongoDB(){
    try {
         await mongoose.connect(process.env.MONGODB_URI||'')
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
        throw new Error('Failed to connect to MongoDB')
        
    }
}



server.tool('getWeatherByCityName',{
    city: z.string().describe('The name of the city to get the weather for'),
},async({city})=>{
    return {
        content: [
            {
                type:'text',
                text: JSON.stringify(await getWeatherByCityName(city))
            }
        ]}
});

server.tool('get_users',{},async()=>{
    await connectToMongoDB()
    const users = await User.find()
    return{
        content:[{type:'text',text:JSON.stringify(users)}]
    }
})

server.tool('add_user',
    {
        name: z.string(),
        email: z.string().email()
    }, async({name,email})=>{
        await connectToMongoDB()
        const newUser = new User({
            email,
            name
        })
        await newUser.save()
        return {
            content: [{type:'text',text:`User ${name} added successfully`
            }]
        }
    }
)

async function main(){
    console.log(process.env.MONGODB_URI)
    await connectToMongoDB()
    const transport = new StdioServerTransport()
    console.log('Starting weather server...')
    await server.connect(transport)
}

main();