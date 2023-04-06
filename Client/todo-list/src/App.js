import {useState, useEffect} from 'react';
import axios from 'axios'
import './App.css';

async function postImage({image, description}) {
  const formData = new FormData();
  formData.append("image", image)
  formData.append("description", description)

  const result = await axios.post('/images', formData, { headers: {'Content-Type': 'multipart/form-data'}})
  return result.data
}

function App() {

  const [itemText, setItemText] = useState('')
  const [listItems, setListItems] = useState([])
  const [listUpdate, updateListItem] = useState('')
  const [updateItemText, updateListItemText] = useState('')
  const [file, setFile] = useState()
  const [description, setDescription] = useState("")
  const [images, setImages] = useState([])

  const addItem = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post('http://localhost:8080/api/additem', {item:itemText,status:false});
      setListItems(prev => [...prev, res.data]);
      setItemText('');
    } catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    const getAllItems = async () => {
      try{
        const res = await axios.get('http://localhost:8080/api/getList');
        setListItems(res.data);
      } catch(err){
        console.log(err);
      }
    }
    getAllItems();
  },[])

  const deleteItemById = async (id) => {
    try{
      const res = await axios.delete(`http://localhost:8080/api/deleteitem/${id}`);
      const newListItems = listItems.filter(item => item._id !== id);
      setListItems(newListItems)
      console.log(res.data);
    }catch(err){
      console.log(err);
    }
  }

  const updateItemNameById = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post(`http://localhost:8080/api/updateitem/${listUpdate}`,{item:updateItemText});
      console.log(res.data);
      const updateItemList = listItems.findIndex(item => item._id === listUpdate);
      const updateitem = listItems[updateItemList].item = updateItemText;
      updateListItemText('');
      updateListItem('');
    }catch(err){
      console.log(err);
    }
  }

  const makeDoneById = async (id) => {
    // e.preventDefault();
    try{
      const res = await axios.post(`http://localhost:8080/api/updateitem/${id}`,{status:true});
      console.log(res.data);
      const Receiver = {to:'udesh696@gmail.com',subject:'Test Email',description:'Sending email via node js'}
      const emailRes = await axios.post('/api/sendemail',JSON.stringify(Receiver));
      console.log(emailRes.data);
      // const updateItemList = listItems.findIndex(item => item._id === listUpdate);
      // const updateitem = listItems[updateItemList].item = updateItemText;
      // updateListItemText('');
      // updateListItem('');
    }catch(err){
      console.log(err);
    }
  }

  const renderUpdateForm = () => (
    <form className='update-form' onSubmit={(e) =>{updateItemNameById(e)}}>
      <input className="update-new-item" type='text' placeholder='New Name for the item' onChange={e =>{updateListItemText(e.target.value)}} value={updateItemText} />
      <button className="update-new-btn" type='submit'>Update</button>
    </form>
  )

  const submit = async event => {
    event.preventDefault()
    const res = await axios.post('http://localhost:8080/api/additem', {item:'',status:false,imagekey:file})
    const result = await postImage({image: file, description})
    setImages([result.image, ...images])
  }

  const fileSelected = event => {
    const file = event.target.files[0]
		setFile(file)
	}

  return (
    <div className="App">
      <h1>Todo List</h1>
      <form className="form" onSubmit={e => addItem(e)}>
        <input type='text' placeholder='Add Item' onChange={e =>{setItemText(e.target.value)}} value={itemText}/>
        <button type='submit'>Add</button>
      </form>
      <form onSubmit={submit} >
        <input onChange={fileSelected} type="file" accept="image/*"></input>
        <input value={description} onChange={e => setDescription(e.target.value)} type="text"></input>
        <button type="submit">Submit</button>
      </form>

      { images.map( image => (
        <div key={image}>
          <img src={image}></img>
        </div>
      ))}
      <div className="todo-listItems">
        {
          listItems.map(item => (
            <div className="todo-item">
              {
                listUpdate === item._id
                ? renderUpdateForm()
                : <>
                    <p className={`item-content${item.status}`}>{item.item}</p>
                    {/* if (item.item == ''){
                    <p className={`item-content${item.status}`}>{item.item}</p>
                    }else{
                      <img src={`/images/${item.imagekey}`}></img>} */}
                    <button className="done-item" onClick={() => {makeDoneById(item._id)}}>Done</button>
                    <button className="update-item" onClick={() => {updateListItem(item._id)}}>Update</button>
                    <button className="delete-item" onClick={() => {deleteItemById(item._id)}}>Delete</button>
                
                  </>
              }
            </div>
          )
          )
        }
      </div>
    </div>
  );
}

export default App;
