import { store } from "../index";

export default class Auth {
    static getUsername = () => {
        return localStorage.getItem('JWT_USERNAME')
    }
    static isLoggedIn = () => {
        let dateString = localStorage.getItem('JWT_TOKEN_GET_DATE')
        if (dateString == null) return false
        let date = new Date(dateString)
        if (isNaN(date)) return false
        let currDate = new Date()
        var diff = (currDate.getTime() - date.getTime()) / 1000
        diff /= 60
        if (diff > 5)
            return false
        return true
    }

    static fetch = (link, method, body) => {
        return new Promise((resolve, reject) => {
            let status = -1;
            let headers = {
                "Content-type": "application/json; charset=UTF-8",
            }
            if (this.isLoggedIn()) {
                headers['Authorization'] = "Bearer " + localStorage.getItem("JWT_ACCESS_TOKEN")
            }
            fetch(link, {
                method: method,
                headers: headers,
                body: body,
            }).then(function (response) {
                status = response.status;
                return response.json();
            }
            )
                .then((data) => {
                    if (status == 401 && data.code == "token_not_valid") {
                        store.dispatch({ type: 'LOGGED_OUT' })
                        localStorage.removeItem('JWT_TOKEN_GET_DATE')
                        console.log("Err1")

                        reject({ status: status, token_error: true, error: true, is_json: true, json: data })
                    } else {
                        resolve({ status: status, token_error: false, error: false, is_json: true, json: data })
                    }
                })
                .catch((err) => {
                    if (status != -1)
                        reject({ status: status, token_error: false, error: true, is_json: false })
                    else
                        reject({ status: -1, token_error: false, error: true, is_json: false })
                    console.log("Err2 " + status)


                }
                )
        })
    }
}