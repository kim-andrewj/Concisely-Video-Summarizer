from sqlalchemy import Column, Integer, String, Text, DateTime
from db.base_class import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    summary = Column(Text)
    transcript = Column(Text)
    timestamp = Column(DateTime)