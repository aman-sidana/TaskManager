import { useState, useEffect } from "react";
import axios from "axios";

const useTheme = () => {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const getTheme = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) return;
                const result = await axios.get(
                    "http://localhost:6100/taskuser/theme",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setTheme(result.data.theme);
            } catch (error) {
                console.log(error);
            }
        };
        getTheme();
    }, []);


    const changeTheme = async (newTheme) => {
        try {
            const token = localStorage.getItem("token");

            const result = await axios.patch(
                "http://localhost:6100/taskuser/theme",
                { theme: newTheme },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTheme(result.data.result.theme);

        } catch (error) {
            console.log(error);
        }
    };

    return { theme, changeTheme };
};

export default useTheme;