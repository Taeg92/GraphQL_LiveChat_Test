import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { gql } from "apollo-boost";
import { useMutation } from "react-apollo-hooks";
import { Query } from "react-apollo";

const ALL_CHAT_BY_ID = gql`
  query allChatById($id: Int!) {
    allChatById(id: $id) {
      id
      text
      source
      user {
        id
        nickname
        avatar
        lang
      }
    }
  }
`;

const CREATE_MESSAGE = gql`
  mutation createMessage(
    $text: String!
    $source: String!
    $userId: Int!
    $roomId: Int!
  ) {
    createMessage(
      text: $text
      source: $source
      userId: $userId
      roomId: $roomId
    )
  }
`;

const NEW_MESSAGE = gql`
  subscription($roomId: Int!) {
    newMessage(roomId: $roomId) {
      id
      text
      source
      user {
        id
        nickname
        avatar
        lang
      }
    }
  }
`;

const DELETE_USER = gql`
  mutation deleteUser($roomId: Int!, $userId: Int!) {
    deleteUser(roomId: $roomId, userId: $userId)
  }
`;

var unsubscribe = null;

const Room = ({ match }) => {
  const history = useHistory();
  const location = useLocation();
  const { userId, code, nickname, avatar, lang, isUnsubscribe } = location.state;
  const roomId = parseInt(match.params.id);
  const [text, setText] = useState("");
  
  const [mutation] = useMutation(CREATE_MESSAGE, {
    variables: {
      userId,
      text,
      source: lang,
      roomId,
    },
  });
  
  const [deleteUserMutation] = useMutation(DELETE_USER, {
    variables: {
      roomId,
      userId,
    }
  });

  const handleDeleteClick = async () => {
    const { data } = await deleteUserMutation();
    if (data.deleteUser) {
      unsubscribe = null;
      history.push('/');
    } else {
      console.log('Error')
    }
  };
  
  return (
    <>
      <h1>Room Code: {code}</h1>
      <button onClick={handleDeleteClick}>나가기</button>
      <Query query={ALL_CHAT_BY_ID} variables={{ id: roomId }}>
        {({ loading, data, subscribeToMore }) => {
          if (loading) {
            return null;
          }
          if (!unsubscribe) {
            unsubscribe = subscribeToMore({
              document: NEW_MESSAGE,
              variables: { roomId },
              updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev;
                const { newMessage } = subscriptionData.data;
                return {
                  allChatById: [...prev.allChatById, newMessage],
                };
              },
            });
          }
          return (
            <div>
              {data.allChatById.map((x) => (
                <h3 key={x.id}>
                  {x.user.nickname} : {x.text}
                </h3>
              ))}
            </div>
          );
        }}
      </Query>
      <div>
        <input
          type="text"
          value={text}
          placeholder="내용을 입력하세요"
          onChange={(e) => {
            setText(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              setText("");
              mutation();
            }
          }}
        />
        <button
          onClick={() => {
            setText("");
            mutation();
          }}
        >
          확인
        </button>
      </div>
    </>
  );
};

export default Room;
