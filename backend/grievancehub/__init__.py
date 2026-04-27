# GrievanceHub-MGIT
# Make PyMySQL act as MySQLdb so Django's mysql backend works
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass
