import bcrypt from 'bcryptjs'
// @ts-expect-error TypeScript can't refer to node_modules for now
import type {StatusCode} from "hono/dist/types/utils/http-status.js";

import type {RegisterInput, LoginInput} from "@/types/user.js";
import CustomLogger from "@/helpers/customLogger.js";
import {SupabaseClient} from "@supabase/supabase-js";

export const register = async (supabase: typeof SupabaseClient, input: RegisterInput) => {
    const {name, email, password} = input;

    const {
        data: existingUser,
        error: findError
    } = await supabase.from('users').select('*').eq('email', email).maybeSingle();

    if (existingUser) {
        CustomLogger('User already exists', `email: ${email}`)

        return {error: 'User already exists', status: 409 as StatusCode, data: null};
    }

    if (findError) {
        CustomLogger(findError.message, `email: ${email}`)

        return {error: findError.message, status: 500 as StatusCode, data: null};
    }

    const password_hash = await bcrypt.hash(password, 10);
    const {data, error} = await supabase.from('users').insert([{name, email, password_hash}]);

    if (error) {
        return {error: error.message, status: 500 as StatusCode, data: null};
    }

    return {error: null, status: 201 as StatusCode, data};
}

export const login = async (supabase: typeof  SupabaseClient, input: LoginInput) => {
    const {email, password} = input

    const {data, error} = await supabase.from('users').select('*').eq('email', email).maybeSingle();

    if(error){
        CustomLogger(error.message, `email: ${email}`)

        return {error: error.message, status: 500 as StatusCode, data: null};
    }

    const is_correct_password = await bcrypt.compare(password, data.password_hash);

    if(is_correct_password){
        const payload = {...data}

        delete payload.password_hash

        return {error: null, status: 200 as StatusCode, data: payload};
    }

    return {error: 'Invalid credentials', status: 401 as StatusCode, data: null};
};
