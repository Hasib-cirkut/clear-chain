import {Hono} from "hono"
// @ts-ignore
import type {StatusCode} from "hono/dist/types/utils/http-status.js";

const healthCheck = new Hono()

healthCheck.get('/', (c) => {
    return c.json({message: 'healthy'}, 200 as StatusCode)
})

export default healthCheck