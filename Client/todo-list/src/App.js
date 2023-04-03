import {useState, useEffect} from 'react';
import axios from 'axios'
import './App.css';

function App() {

  const [itemText, setItemText] = useState('')
  const [listItems, setListItems] = useState([])
  const [listUpdate, updateListItem] = useState('')
  const [updateItemText, updateListItemText] = useState('')

  const addItem = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post('http://localhost:8080/api/additem', {item:itemText});
      setListItems(prev => [...prev, res.data]);
      // console.log(res);
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

  const updateItemById = async (e) => {
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

  const renderUpdateForm = () => (
    <form className='update-form' onSubmit={(e) =>{updateItemById(e)}}>
      <input className="update-new-item" type='text' placeholder='New Name for the item' onChange={e =>{updateListItemText(e.target.value)}} value={updateItemText} />
      <button className="update-new-btn" type='submit'>Update</button>
    </form>
  )

  return (
    <div className="App">
      <h1>Todo List</h1>
      <form className="form" onSubmit={e => addItem(e)}>
        <input type='text' placeholder='Add Item' onChange={e =>{setItemText(e.target.value)}} value={itemText}/>
        <button type='submit'>Add</button>
      </form>
      <div className="todo-listItems">
        {
          listItems.map(item => (
            <div className="todo-item">
              {
                listUpdate === item._id
                ? renderUpdateForm()
                : <>
                    <p className="item-content">{item.item}</p>
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
