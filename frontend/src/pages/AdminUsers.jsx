import { useEffect, useState } from "react";
import axios from "../api/axios";

const AdminUsers = () => {

  const [users, setUsers] =
    useState([]);

  useEffect(() => {

    fetchUsers();

  }, []);

  const fetchUsers =
    async () => {

      try {

        const { data } =
          await axios.get(
            "/admin/users"
          );

        setUsers(
          data.users
        );

      }
      catch(error){

        console.log(error);

      }

    };

  const deleteUser =
    async (id) => {

      try {

        await axios.delete(
          `/admin/user/${id}`
        );

        fetchUsers();

      }
      catch(error){

        console.log(error);

      }

    };

  return (

    <div>

      <h1>
        Manage Users
      </h1>

      <table border="1">

        <thead>

          <tr>

            <th>
              Name
            </th>

            <th>
              Email
            </th>

            <th>
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {users.map(
            (user) => (

              <tr
                key={user._id}
              >

                <td>
                  {user.name}
                </td>

                <td>
                  {user.email}
                </td>

                <td>

                  <button
                    onClick={() =>
                      deleteUser(
                        user._id
                      )
                    }
                  >
                    Delete
                  </button>

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  );

};

export default AdminUsers;