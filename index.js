const baseUrl = "http://localhost:5087/api/Rabbits";
const authUrl = "http://localhost:5087/api/Auth/login";

Vue.createApp({

    data() {
        return {
            rabbits: [],
            allRabbits: [],
            filterText: "",

            auth: {
                username: "",
                password: ""
            },

            authMessage: "",
            userInfo: null,
            token: null,

            addData: {
                name: "",
                color: "",
                weight: null,
                motherId: null
            },

            addMessage: "",

            deleteId: null,
            deleteMessage: ""
        }
    },

    methods: {

        // LOGIN
        async login() {
            try {
                const res = await axios.post(authUrl, this.auth);

                this.token = res.data.token;

                axios.defaults.headers.common["Authorization"] = "Bearer " + this.token;

                this.userInfo = this.parseJwt(this.token);

                this.authMessage = "";

            } catch (err) {
                this.authMessage = "Login fejlede ";
            }
        },

        logout() {
            this.userInfo = null;
            this.token = null;
            this.rabbits = [];

            delete axios.defaults.headers.common["Authorization"];
        },

        // GET ALL
        async getRabbits() {
            try {
                const res = await axios.get(baseUrl);

                this.allRabbits = res.data;
                this.rabbits = res.data;

            } catch (error) {
                console.log(error);
                alert("Kunne ikke indlæse kaniner");
            }
        },

        // FILTER
        filterByName() {
            this.rabbits = this.allRabbits.filter(r =>
                r.name.toLowerCase().includes(this.filterText.toLowerCase())
            );
        },

        resetFilter() {
            this.rabbits = this.allRabbits;
            this.filterText = "";
        },

        // SORT
        sortByName() {
            this.rabbits.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        },

        sortByWeightAsc() {
            this.rabbits.sort((a, b) =>
                a.weight - b.weight
            );
        },

        sortByWeightDesc() {
            this.rabbits.sort((a, b) =>
                b.weight - a.weight
            );
        },

        // ADD
        async addRabbit() {

            if (!this.addData.name || !this.addData.color || this.addData.weight == null) {
                this.addMessage = "Ugyldigt input";
                return;
            }

            try {
                await axios.post(baseUrl, this.addData);

                this.addMessage = "Kanin tilføjet";

                this.addData = {
                    name: "",
                    color: "",
                    weight: null,
                    motherId: null
                };

                this.getRabbits();

            } catch (error) {
                console.log(error);
                this.addMessage = "Fejl ved tilføjelse af kanin";
            }
        },

        // DELETE
        async deleteRabbit() {

            if (!this.deleteId || this.deleteId <= 0) {
                this.deleteMessage = "Ugyldigt ID";
                return;
            }

            try {
                await axios.delete(`${baseUrl}/${this.deleteId}`);

                this.deleteMessage = "Kanin slettet";
                this.getRabbits();

            } catch (error) {
                if (error.response && error.response.status === 404) {
                    this.deleteMessage = "Kanin ikke fundet";
                } else {
                    this.deleteMessage = "Fejl ved sletning af kanin";
                }
            }
        },

        // JWT decode
        parseJwt(token) {
            const base64 = token.split('.')[1];
            const decoded = JSON.parse(atob(base64));

            return {
                username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
            };
        }

    }

}).mount("#app");