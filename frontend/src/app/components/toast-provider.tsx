"use client"

import {Toaster} from "react-hot-toast";

const ToastProvider = () => {
    return (
        <Toaster
            position="bottom-center"
            toastOptions={{
                style: {
                    fontSize: "22px",
                },

            }}
            reverseOrder={true}
        />
    )
}

export default ToastProvider;