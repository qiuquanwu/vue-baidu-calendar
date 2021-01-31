export default (year,month)=>{
    var d = new Date(year, month, 0);
    return d.getDate();
}