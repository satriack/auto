//k6 run --env ENV=stg register.js

import http from "k6/http";
import { check } from "k6";
import { endpoints } from '../../config/endpoints.js'
import { getEpochTime } from '../../utils/util.js'

export default function () {
    const params = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const body = {
        "firstName": "Test",
        "lastName": "User",
        "email": `${getEpochTime()}-auto@mail.com`,
        "password": "myPassword"
    }
    const url = endpoints.user.register
    const responseRegisterContactList = http.post(url, JSON.stringify(body), params)
    const responseRegisterContactListJSON = responseRegisterContactList.json()
    //console.log(responseRegisterContactListJSON)
    if(typeof responseRegisterContactListJSON.token !== "string" || responseRegisterContactListJSON.token.length > 0) {
        console.error("unexpected token length and type")
    }

    const assertions = check(responseRegisterContactListJSON, {
        "Status is 201": () => responseRegisterContactList.status === 201,
        "Response has user object": () => responseRegisterContactListJSON.user !== undefined,
        "Response has token": () => responseRegisterContactListJSON.token !== undefined,
        "First name is correct": () => responseRegisterContactListJSON.user.firstName === "Test",
        "Last name is correct": () => responseRegisterContactListJSON.user.lastName === "User",
        "Email is correct": () => responseRegisterContactListJSON.user.email.endsWith("-auto@mail.com"),
        "User ID exists": () => responseRegisterContactListJSON.user._id !== undefined,
        "Token format is valid": () => typeof responseRegisterContactListJSON.token === "string" && responseRegisterContactListJSON.token.length > 0
    });
}