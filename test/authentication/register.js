import http from "k6/http";
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
}

//k6 run --env ENVIRONMENT=staging register.js