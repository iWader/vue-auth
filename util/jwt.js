import Base64 from 'Base64'

export default {

    decode(token) {

        const parts = token.split('.');

        var encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        switch (encoded.length % 4) {
            case 0:
                break;
            case 2:
                encoded += '==';
                break;
            case 3:
                encoded += '=';
                break;
        }

        return JSON.parse(decodeURIComponent(Base64.atob(encoded)));

    },

    getDeadline(token) {

        const decoded = this.decode(token);

        if (typeof decoded.exp === 'undefined') return null;

        var deadline = new Date(0);

        deadline.setUTCSeconds(decoded.exp);

        return deadline;

    },

    isExpired(token) {

        const deadline = this.getDeadline(token);

        if (deadline === null) return false;

        const now = new Date();

        return deadline.valueOf() <= now.valueOf();

    }

}