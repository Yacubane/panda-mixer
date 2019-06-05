import { store } from "../index";

export default class Auth {
    static logout = () => {
        localStorage.removeItem('JWT_TOKEN_GET_DATE');
        localStorage.removeItem('JWT_REFRESH_TOKEN');
        localStorage.removeItem('JWT_ACCESS_TOKEN');
        store.dispatch({ type: 'LOGGED_OUT' })
    };
    static getUsername = () => {
        return localStorage.getItem('JWT_USERNAME')
    };
    static isLoggedIn = () => {
        let dateString = localStorage.getItem('JWT_TOKEN_GET_DATE');
        if (dateString == null) return false;
        let accessToken = localStorage.getItem('JWT_ACCESS_TOKEN');
        if (accessToken === null || accessToken === "") return false;
        let date = new Date(dateString);
        if (isNaN(date)) return false;
        let currDate = new Date();
        var diff = (currDate.getTime() - date.getTime()) / 1000;
        diff /= 60;
        if (diff > 5)
            return false;
        return true
    };

    static wasLoggedIn = () => {
        let refreshToken = localStorage.getItem('JWT_REFRESH_TOKEN');
        return refreshToken != null && refreshToken.length > 0
    };

    static refreshToken = () => {
        return new Promise((resolve, reject) => {
            let status;
            fetch('http://127.0.0.1:8000/api/refresh_token/', {
                method: 'POST',
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify({ refresh: localStorage.getItem('JWT_REFRESH_TOKEN') })
            }).then((response) => {
                status = response.status;
                if (status !== 200) {
                    this.logout();
                    reject(null)
                }
                return response.json();
            }
            )
                .then((data) => {
                    if (data.access == null) {
                        this.logout()
                        reject(null)
                    } else {
                        localStorage.setItem('JWT_ACCESS_TOKEN', data.access);
                        localStorage.setItem('JWT_TOKEN_GET_DATE', new Date());
                        store.dispatch({ type: 'LOGGED_IN' })
                        resolve(null)
                    }
                })
                .catch((err) => {
                    reject(null)
                }
                )

        })
    };

    static fetch = (link, method, body) => {
        return this.fetch_(link, method, body, 3)
    };
    static fetch_ = (link, method, body, tries_num) => {

        if (tries_num < 1) return null
        return new Promise((resolve, reject) => {
            if (tries_num < 1) reject(null);
            let status = -1;
            let headers = {
                "Content-type": "application/json; charset=UTF-8",
            };
            if (this.isLoggedIn()) {
                headers['Authorization'] = "Bearer " + localStorage.getItem("JWT_ACCESS_TOKEN")
            }
            if (!this.isLoggedIn() && !this.wasLoggedIn()) {
                store.dispatch({ type: 'LOGGED_OUT' })
            }

            if (!this.isLoggedIn() && this.wasLoggedIn()) {
                this.refreshToken()
                    .then((response) => {
                        this.fetch_(link, method, body, tries_num - 1)
                            .then((response) => {
                                resolve(response)
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    })
                    .catch((err) => {
                        this.fetch_(link, method, body, tries_num - 1)
                            .then((response) => {
                                resolve(response)
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    })
            } else {
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
                        if (status === 401 && data.code === "token_not_valid") {
                            if (tries_num > 1 && this.isLoggedIn()) {
                                localStorage.removeItem('JWT_TOKEN_GET_DATE'); //try to refresh token in next iteration
                                this.fetch_(link, method, body, tries_num - 1)
                                    .then((response) => {
                                        resolve(response)
                                    })
                                    .catch((err) => {
                                        reject(err)
                                    })
                            } else {
                                reject({ status: status, token_error: true, error: true, is_json: true, json: data })
                            }
                        } else {
                            resolve({ status: status, token_error: false, error: false, is_json: true, json: data })
                        }
                    })
                    .catch((err) => {
                        reject({ status: status, token_error: false, error: true, is_json: false });
                    }
                    )
            }
        })
    }
}