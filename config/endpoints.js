const env = {
    stg: {
        user: {
            register: "",
            login: ""
        }
    },
    prod: {
        user: {
            register: "https://thinking-tester-contact-list.herokuapp.com/users",
            login: "https://thinking-tester-contact-list.herokuapp.com/users/login"
        }
    }
}

const environment = __ENV.ENVIRONMENT || 'staging';

export const endpoints = env[environment];