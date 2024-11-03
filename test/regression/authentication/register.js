import http from "k6/http";
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { check } from "k6";
import { endpoints } from '../../../config/endpoints.js';
import { getEpochTime } from '../../../utils/util.js';
import { SharedArray } from 'k6/data';

function csvPath() {
    switch (__ENV.ENV) {
        case 'prod':
            return '../../data/register.data.csv';
        case 'stg':
            return '';
        default:
            console.error("Environment not recognized");
            return null;
    }
}

let registerTestCase = new SharedArray('data', function () {
    return papaparse.parse(open(csvPath()), { header: true, dynamicTyping: true }).data;
});

export default function () {
    const params = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    for (let i = 0; i < registerTestCase.length; i++) {
        const url = endpoints.user.register;
        let response;

        switch (registerTestCase[i].caseType) {
            case 'positive':
                response = postRegisterRequest(url, bodyRegisterRequest(i, 'positive'), params);
                const responseJSON = response.json()
                if (typeof responseJSON.token !== "string" || responseJSON.token.length < 0) {
                    console.error("unexpected response, token length or token type. \n", JSON.stringify(response))
                }
                handlePositiveAssertions(response, i);
                break;

            case 'negative':
                response = postRegisterRequest(url, bodyRegisterRequest(i, 'negative'), params);
                handleNegativeAssertions(response, i);
                break;

            default:
                console.log("Running other caseType...");
        }
    }
}

export function postRegisterRequest(url, body, params) {
    return http.post(url, JSON.stringify(body), params);
}

export function bodyRegisterRequest(i) {
    const testCase = registerTestCase[i];
    // 8th testcase is idempotent request (-)
    return {
        "firstName": testCase.firstName,
        "lastName": testCase.lastName,
        "email": (testCase.no === 8 ? testCase.email : getEpochTime() + testCase.email),
        "password": testCase.password
    };
}

// Assertion functions
function handlePositiveAssertions(response, i) {
    const responseData = response.json();
    check(response, {
        "+ Status is 201": () => response.status === 201,
        "+ Register user as requested": () => responseData.user.firstName === registerTestCase[i].firstName && responseData.user.lastName === registerTestCase[i].lastName,
        "+ Token format is valid": () => typeof responseData.token === "string" && responseData.token.length > 0,
        "+ First name is correct": () => responseData.user.firstName === registerTestCase[i].firstName,
        "+ Email is correct": () => responseData.user.email.endsWith(registerTestCase[i].email)
    });
}

function handleNegativeAssertions(response, i) {
    check(response, {
        "- Status is 400 or 422": () => response.status === 400 || response.status === 422,
        "- Error message is match": () => response.json().message === registerTestCase[i].message,
    });
}