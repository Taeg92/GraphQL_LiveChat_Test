import React, { useState } from "react";
import { useLocation } from "react-router-dom";
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
        lang
      }
    }
  }
`;

const CREATE_MESSAGE = gql`
  mutation createMessage(
    $text: String!
    $source: String!
    $nickname: String!
    $roomId: Int!
  ) {
    createMessage(
      text: $text
      source: $source
      nickname: $nickname
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
        lang
      }
    }
  }
`;

let unsubscribe = null;

const Room = ({ match }) => {
  const location = useLocation();
  const { data: roomInfo, nickname, avatar, lang } = location.state;
  const roomId = parseInt(match.params.id);
  const [text, setText] = useState("");

  const [mutation] = useMutation(CREATE_MESSAGE, {
    variables: {
      nickname,
      text,
      source: lang,
      roomId,
    },
  });

  return (
    <>
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
