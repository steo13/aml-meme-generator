import { ListGroup } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

const filters = [
    {href: 'public', name: 'Public'},
    {href: 'protected', name: 'Protected'},
]

function Sidebar(props){
    return (
        <div className={`d-md-block col-4 bg-light`} id="filter">
            <ListGroup variant="flush" className="p-4" activeKey={props.filter}>
                {filters.map((filter, i) =>
                        !props.loggedIn && filter.name === 'Protected' ? 
                            <ListGroup.Item key={i} disabled>
                                {filter.name}
                            </ListGroup.Item> :
                            <NavLink key={i} to={`/${filter.href}`}>
                                <ListGroup.Item as='div' title={filter.name} href={filter.href} onClick={() => { props.load(filter.href)}} action>
                                    {filter.name}
                                </ListGroup.Item> 
                            </NavLink> 
                )}
            </ListGroup>
        </div>
    )
}

export default Sidebar;