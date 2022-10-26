
function subscribe(event) {

    event.preventDefault();

    let artist = document.getElementById('Artist').value;
    let title = document.getElementById('Title').value;
    let year = document.getElementById('Year').value;

    axios
        .post("/subscribe", {
            Artist: artist,
            Title: title,
            Annual_Time: year
        })
        .catch(function (err) {
            console.log(err);
        });
}