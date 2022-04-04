function AddButton(props) {
    return (
        <img title="Add a new meme" src="images/add.png" id="button-svg" height="40" alt='' 
            onClick={() => {props.showModal(true)}} />
    );
}

export { AddButton };