from ..interfaces.session_persistence import session_persistence
from ...objects.session import session
from ...business.utils import get_db_connection
from datetime import datetime, timedelta

class epoch_session_persistence(session_persistence):
    def __init__(self):
        pass

    def add_session(self, new_session: session):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"DELETE FROM sessions WHERE user_id = {new_session.user_id}")
        cursor.execute(f"INSERT INTO sessions VALUES ('{new_session.session_id}', '{new_session.user_id}')")
        connection.commit()
        cursor.close()
        connection.close()

    def remove_session(self, session_id: str):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"DELETE FROM sessions WHERE session_id = '{session_id}'")
        connection.commit()
        cursor.close()
        connection.close()

    def get_session(self, session_id: str):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM sessions WHERE session_id = '{session_id}'")
        result = cursor.fetchall()
        cursor.close()
        connection.close()

        if len(result) == 0 or len(result) > 1:
            return None
        else:
            session_data = result[0][:2]
            timestamp = result[0][2]

            if timestamp + timedelta(days=1) < datetime.now():
                self.remove_session(session_id)
                return None
            else:
                return session(*session_data), timestamp

    def get_all_sessions(self):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM sessions")
        result = cursor.fetchall()
        cursor.close()
        connection.close()

        sessions = []

        for row in result:
            sessions.append(session(row[0], row[1]))

        return sessions

    def remove_by_user_id(self, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"DELETE FROM sessions WHERE user_id = {user_id}")
        connection.commit()
        cursor.close()
        connection.close()

    def get_user_by_session_id(self, session_id: str):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"SELECT user_id FROM sessions WHERE session_id = '{session_id}'")
        result = cursor.fetchall()
        cursor.close()
        connection.close()
        return result