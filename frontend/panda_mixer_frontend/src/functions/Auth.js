import {store} from "../index";

export default class Auth {
    static logout = () => {
        localStorage.removeItem('JWT_TOKEN_GET_DATE');
        localStorage.removeItem('JWT_REFRESH_TOKEN');
        localStorage.removeItem('JWT_ACCESS_TOKEN');
        store.dispatch({type: 'LOGGED_OUT'})
    };
    static getUsername = () => {
        return localStorage.getItem('JWT_USERNAME')
    };
    static isLoggedIn = () => {
        let dateString = localStorage.getItem('JWT_TOKEN_GET_DATE');
        if (dateString == null) return false;
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
                body: JSON.stringify({refresh: localStorage.getItem('JWT_REFRESH_TOKEN')})
            }).then((response) => {
                    status = response.status;
                    return response.json();
                }
            )
                .then((data) => {
                    localStorage.setItem('JWT_ACCESS_TOKEN', data.access);
                    localStorage.setItem('JWT_TOKEN_GET_DATE', new Date());
                    resolve(null)
                })
                .catch((err) => {
                        localStorage.removeItem('JWT_REFRESH_TOKEN');
                        reject(null)
                    }
                )

        })
    };

    static fetch = (link, method, body) => {
        return fetch(link, method, body, 2)
    };
    static fetch = (link, method, body, tries_num) => {
        return new Promise((resolve, reject) => {
            let status = -1;
            let headers = {
                "Content-type": "application/json; charset=UTF-8",
            };
            if (this.isLoggedIn()) {
                headers['Authorization'] = "Bearer " + localStorage.getItem("JWT_ACCESS_TOKEN")
            } else if (this.wasLoggedIn()) {
                this.refreshToken()
                    .then((response) => {
                        this.fetch(link, method, body, tries_num--)
                            .then((response) => {
                                resolve(response)
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    })
                    .catch((err) => {
                        console.log("Error");

                        reject(err)
                    });
                return
            } else {
                store.dispatch({type: 'LOGGED_OUT'})
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
                        if (tries_num > 1) {
                            this.refreshToken()
                                .then((response) => {
                                    this.fetch(link, method, body, tries_num--)
                                        .then((response) => {
                                            resolve(response)
                                        })
                                        .catch((err) => {
                                            reject(err)
                                        })
                                })
                                .catch((err) => {
                                    reject(err)
                                })
                        } else {
                            store.dispatch({type: 'LOGGED_OUT'});
                            localStorage.removeItem('JWT_TOKEN_GET_DATE');
                            reject({status: status, token_error: true, error: true, is_json: true, json: data})
                        }
                    } else {
                        resolve({status: status, token_error: false, error: false, is_json: true, json: data})
                    }
                })
                .catch((err) => {
                        if (status != -1)
                            reject({status: status, token_error: false, error: true, is_json: false});
                        else
                            reject({status: -1, token_error: false, error: true, is_json: false})

                    }
                )
        })
    }
}