function nextDate(date = new Date()) {
    　　date = new Date(date);
    　　date = +date + 1000 * 60 * 60 * 24;
    　　date = new Date(date);
    　　return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

export default nextDate